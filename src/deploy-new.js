import React, { useState } from 'react'
import { nanoid } from 'nanoid'
import { FormField } from 'sanity'
import { useClient } from './hook/useClient'
import {
  useToast,
  Dialog,
  Grid,
  Box,
  Stack,
  Button,
  TextInput,
  Switch,
} from '@sanity/ui'

const NewDeploymentForm = ({ setIsFormOpen }) => {
  const toast = useToast()
  const WEBHOOK_TYPE = 'webhook_deploy'
  const client = useClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const initialDeploy = {
    name: '',
    appId: '',
    token: '',
    deployOnPublish: 0,
  }
  const [newDeploy, setNewDeploy] = useState(initialDeploy)

  const setAppId = (e) => {
    e.persist()
    let appId = e?.target?.value
    if (appId.substr(0, 4) === 'http') {
      appId = appId.replaceAll('?', '/').split('/')[4]
    }
    setNewDeploy((prevState) => ({
      ...prevState,
      ...{ appId },
    }))
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    client
      .create({
        // Explicitly define an _id inside the digitalocean-deploy path to make sure it's not publicly accessible
        // This will protect users' tokens & project info. Read more: https://www.sanity.io/docs/ids
        _id: `digitalocean-deploy.${nanoid()}`,
        _type: WEBHOOK_TYPE,
        ...newDeploy,
      })
      .then(() => {
        toast.push({
          status: 'success',
          title: 'Success!',
          description: `Created Deployment: ${newDeploy.title}`,
        })
        setIsSubmitting(false)
        setNewDeploy(initialDeploy) // Reset the pending webhook state
        setIsFormOpen(false)
      })
  }
  return (
    <Dialog
      header="New Project Deployment"
      id="create-webhook"
      width={1}
      onClickOutside={() => setIsFormOpen(false)}
      onClose={() => setIsFormOpen(false)}
      footer={
        <Box padding={3}>
          <Grid columns={2} gap={3}>
            <Button
              padding={4}
              mode="ghost"
              text="Cancel"
              onClick={() => setIsFormOpen(false)}
            />
            <Button
              padding={4}
              text="Create"
              tone="primary"
              loading={isSubmitting}
              onClick={() => onSubmit()}
              disabled={isSubmitting || !newDeploy.appId || !newDeploy.token}
            />
          </Grid>
        </Box>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          <FormField
            title="Display Name"
            description="Give your deploy a name, like 'Production'"
          >
            <TextInput
              type="text"
              value={newDeploy.name}
              onChange={(e) => {
                e.persist()
                setNewDeploy((prevState) => ({
                  ...prevState,
                  ...{ name: e?.target?.value },
                }))
              }}
            />
          </FormField>

          <FormField
            title="DigitalOcean App ID"
            description="Or just paste the URL of the App page from your dashboard."
          >
            <TextInput
              type="text"
              value={newDeploy.appId}
              placeholder="https://cloud.digitalocean.com/apps/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/overview?i=000000"
              onChange={setAppId}
            />
          </FormField>

          <FormField
            title="DigitalOcean API token"
            description={
              <span>
                <a href="https://cloud.digitalocean.com/account/api/tokens?i=172188">
                  Generate an API Token here
                </a>
                . Must have <strong>write</strong> permission.{' '}
              </span>
            }
          >
            <TextInput
              type="text"
              value={newDeploy.token}
              placeholder="a0a0a000aa0aa000a000a000000000000aa0a00000aaaaa0000000000aa0a00a"
              onChange={(e) => {
                e.persist()
                setNewDeploy((prevState) => ({
                  ...prevState,
                  ...{ token: e?.target?.value },
                }))
              }}
            />
          </FormField>
          <FormField title="Automatically deploy on Publish">
            <Switch
              checked={newDeploy.deployOnPublish === 1}
              onChange={(e) => {
                e.persist()
                setNewDeploy((prevState) => ({
                  ...prevState,
                  ...{
                    deployOnPublish: !!newDeploy.deployOnPublish ? 0 : 1,
                  },
                }))
              }}
            />
          </FormField>
        </Stack>
      </Box>
    </Dialog>
  )
}

export default NewDeploymentForm
