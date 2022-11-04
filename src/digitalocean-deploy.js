import React, { useState, useEffect } from 'react'
import sanityClient from 'part:@sanity/base/client'
import {
  studioTheme,
  ThemeProvider,
  Container,
  Flex,
  Box,
  Card,
  Stack,
  Spinner,
  Button,
  Text,
} from '@sanity/ui'

import DeployItem from './deploy-item'
import NewDeploymentForm from './deploy-new'

const DigitalOceanDeploy = () => {
  const WEBHOOK_TYPE = 'webhook_deploy'
  const WEBHOOK_QUERY = `*[_type == "${WEBHOOK_TYPE}"] | order(_createdAt)`
  const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deploys, setDeploys] = useState([])

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
                  text="Add Deployment"
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
                    <DeployItem key={deploy._id} id={deploy._id} {...deploy} />
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
                          text="Add Deployment"
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
        <NewDeploymentForm
          {...{
            setIsFormOpen,
          }}
        />
      )}
    </ThemeProvider>
  )
}

export default DigitalOceanDeploy
