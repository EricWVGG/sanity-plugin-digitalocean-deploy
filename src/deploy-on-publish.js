import { useState, useEffect } from 'react'
import { useDocumentOperation } from 'sanity'
import axios from 'axios'
import { useToast } from '@sanity/ui'
import { useClient } from './hook/useClient'

const DeployOnPublish = (props) => {
  const { publish } = useDocumentOperation(props.id, props.type)

  const [isPublishing, setIsPublishing] = useState(false)
  const [webhooks, setWebhooks] = useState([])
  const client = useClient()

  useEffect(() => {
    const WEBHOOK_TYPE = 'webhook_deploy'
    const WEBHOOK_QUERY = `*[_type == "${WEBHOOK_TYPE}"] | order(_createdAt)`
    client.fetch(WEBHOOK_QUERY).then((w) => {
      setWebhooks(w)
    })
  }, [])

  const toast = useToast()

  return {
    disabled: publish.disabled,
    label: isPublishing ? 'Publishing…' : 'Publish',
    onHandle: () => {
      // This will update the button text
      setIsPublishing(true)
      // Perform the publish
      publish.execute()

      Promise.all(
        webhooks
          .filter((d) => d.deployOnPublish > 0)
          .map((deployment) => {
            const { name, appId, token } = deployment
            const config = {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
            const body = JSON.stringify({
              force_build: true,
            })
            axios
              .post(
                `https://api.digitalocean.com/v2/apps/${appId}/deployments`,
                body,
                config
              )
              .then((res) => {
                console.log('response', res)
                toast.push({
                  status: 'success',
                  title: '😄 Deployment Successful',
                  description: `DigitalOcean: “${name}”`,
                })
              })
              .catch((err) => {
                console.log(`error deploying: ${name}`, e)
                toast.push({
                  status: 'error',
                  title: '😡 Deployment Failed',
                  description: `${err}`,
                })
              })
          })
      ).then(() => {
        props.onComplete()
      })
    },
  }
}

export default DeployOnPublish
