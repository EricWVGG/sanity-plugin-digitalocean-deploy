import { useState, useEffect } from 'react'
import { useDocumentOperation } from '@sanity/react-hooks'
import sanityClient from 'part:@sanity/base/client'
import { ToastProvider, useToast } from '@sanity/ui'

const DeployOnPublish = (props) => {
  const toast = useToast()

  const { publish } = useDocumentOperation(props.id, props.type)

  const [isPublishing, setIsPublishing] = useState(false)
  const [webhooks, setWebhooks] = useState([])

  useEffect(() => {
    const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })
    const WEBHOOK_TYPE = 'webhook_deploy'
    const WEBHOOK_QUERY = `*[_type == "${WEBHOOK_TYPE}"] | order(_createdAt)`
    client.fetch(WEBHOOK_QUERY).then((w) => {
      setWebhooks(w)
    })
  }, [])

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
            return fetch(
              `https://api.digitalocean.com/v2/apps/${appId}/deployments`,
              {
                method: 'post',
                headers: new Headers({
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }),
                body: JSON.stringify({
                  force_build: true,
                }),
              }
            )
              .then((e) => {
                console.log(`deployment complete: ${name}`)
                toast.push({
                  status: 'success',
                  title: 'Success!',
                  description: `Triggered Deployment: ${name}`,
                })
              })
              .catch((e) => {
                console.log(`error deploying: ${name}`, e)
              })
          })
      ).then(() => {
        props.onComplete()
      })
    },
  }
}

export default DeployOnPublish
