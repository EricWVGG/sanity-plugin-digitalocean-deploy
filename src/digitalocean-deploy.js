import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import axios from 'axios'

import sanityClient from 'part:@sanity/base/client'

import { FormField } from '@sanity/base/components'

import {
  studioTheme,
  ThemeProvider,
  ToastProvider,
  useToast,
  Container,
  Dialog,
  Grid,
  Flex,
  Box,
  Card,
  Stack,
  Spinner,
  Button,
  Text,
  Inline,
  Heading,
  TextInput,
} from '@sanity/ui'
import { WarningOutlineIcon } from '@sanity/icons'

import DeployItem from './deploy-item'

const initialDeploy = {
  title: '',
  appId: '',
  token: '',
}

const DigitalOceanDeploy = () => {
  const WEBHOOK_TYPE = 'webhook_deploy'
  const WEBHOOK_QUERY = `*[_type == "${WEBHOOK_TYPE}"] | order(_createdAt)`
  const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deploys, setDeploys] = useState([])
  const [pendingDeploy, setpendingDeploy] = useState(initialDeploy)
  const toast = useToast()

  const onSubmit = async () => {
    setIsSubmitting(true)

    client
      .create({
        // Explicitly define an _id inside the digitalocean-deploy path to make sure it's not publicly accessible
        // This will protect users' tokens & project info. Read more: https://www.sanity.io/docs/ids
        _id: `digitalocean-deploy.${nanoid()}`,
        _type: WEBHOOK_TYPE,
        name: pendingDeploy.title,
        appId: pendingDeploy.appId,
        token: pendingDeploy.token,
      })
      .then(() => {
        toast.push({
          status: 'success',
          title: 'Success!',
          description: `Created Deployment: ${pendingDeploy.title}`,
        })
        setIsFormOpen(false)
        setIsSubmitting(false)
        setpendingDeploy(initialDeploy) // Reset the pending webhook state
      })
  }

  // Fetch all existing webhooks and listen for newly created
  useEffect(() => {
    let webhookSubscription

    client.fetch(WEBHOOK_QUERY).then((w) => {
      setDeploys(w)
      setIsLoading(false)

      webhookSubscription = client
        .listen(WEBHOOK_QUERY, {}, { includeResult: true })
        .subscribe((res) => {
          const wasCreated = res.mutations.some((item) =>
            Object.prototype.hasOwnProperty.call(item, 'create')
          )
          const wasDeleted = res.mutations.some((item) =>
            Object.prototype.hasOwnProperty.call(item, 'delete')
          )
          if (wasCreated) {
            setDeploys((prevState) => {
              return [...prevState, res.result]
            })
          }
          if (wasDeleted) {
            setDeploys((prevState) =>
              prevState.filter((w) => w._id !== res.documentId)
            )
          }
        })
    })

    return () => {
      webhookSubscription && webhookSubscription.unsubscribe()
    }
  }, [])

  return (
    <ThemeProvider theme={studioTheme}>
      <ToastProvider>
        <Container display="grid" width={6} style={{ minHeight: '100%' }}>
          <Flex direction="column">
            <Card padding={4} borderBottom>
              <Flex align="center">
                <Flex flex={1} align="center">
                  <Card>
                    <Text as="h1" size={2} weight="semibold">
                      DigitalOcean Deployments
                    </Text>
                  </Card>
                </Flex>
                <Box>
                  <Button
                    type="button"
                    fontSize={2}
                    tone="primary"
                    padding={3}
                    radius={3}
                    text="Add Project"
                    onClick={() => setIsFormOpen(true)}
                  />
                </Box>
              </Flex>
            </Card>

            <Card flex={1}>
              <Stack as={'ul'}>
                {isLoading ? (
                  <Card as={'li'} padding={4}>
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      paddingTop={3}
                    >
                      <Spinner size={4} />
                      <Box padding={4}>
                        <Text size={2}>loading your deployments...</Text>
                      </Box>
                    </Flex>
                  </Card>
                ) : deploys.length ? (
                  deploys.map((deploy) => (
                    <Card key={deploy._id} as={'li'} padding={4} borderBottom>
                      <DeployItem
                        key={deploy._id}
                        name={deploy.name}
                        appId={deploy.appId}
                        id={deploy._id}
                        token={deploy.token}
                      />
                    </Card>
                  ))
                ) : (
                  <Card as={'li'} padding={5} paddingTop={6}>
                    <Flex direction="column" align="center" justify="center">
                      {/* good place for digitalocean logo */}

                      <Flex direction="column" align="center" padding={4}>
                        <Text size={2}>No deployments created yet.</Text>
                        <Box padding={4}>
                          <Button
                            fontSize={3}
                            paddingX={5}
                            paddingY={4}
                            tone="primary"
                            radius={4}
                            text="Add Project"
                            onClick={() => setIsFormOpen(true)}
                          />
                        </Box>

                        <Text size={1} weight="semibold" muted>
                          <a
                            href="https://github.com/EricWVGG"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'inherit' }}
                          >
                            Need help? TODO
                          </a>
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                )}
              </Stack>
            </Card>
          </Flex>
        </Container>

        {isFormOpen && (
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
                    disabled={
                      isSubmitting ||
                      !pendingDeploy.appId ||
                      !pendingDeploy.token
                    }
                  />
                </Grid>
              </Box>
            }
          >
            <Box padding={4}>
              <Stack space={4}>
                <FormField
                  title="Display Title"
                  description="Give your deploy a name, like 'Production'"
                >
                  <TextInput
                    type="text"
                    value={pendingDeploy.title}
                    onChange={(e) => {
                      e.persist()
                      setpendingDeploy((prevState) => ({
                        ...prevState,
                        ...{ title: e?.target?.value },
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="DigitalOcean App ID"
                  description="TODO: app id found here"
                >
                  <TextInput
                    type="text"
                    value={pendingDeploy.appId}
                    placeholder="00aa0000-00aa-000a-0a0a-000000000a00"
                    onChange={(e) => {
                      e.persist()
                      setpendingDeploy((prevState) => ({
                        ...prevState,
                        ...{ appId: e?.target?.value },
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="DigitalOcean API token"
                  description="TODO: app id found here"
                >
                  <TextInput
                    type="text"
                    value={pendingDeploy.token}
                    placeholder="a0a0a000aa0aa000a000a000000000000aa0a00000aaaaa0000000000aa0a00a"
                    onChange={(e) => {
                      e.persist()
                      setpendingDeploy((prevState) => ({
                        ...prevState,
                        ...{ token: e?.target?.value },
                      }))
                    }}
                  />
                </FormField>
              </Stack>
            </Box>
          </Dialog>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}

export default DigitalOceanDeploy
