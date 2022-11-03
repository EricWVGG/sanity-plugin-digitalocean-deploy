import React, { useEffect, useState } from 'react'
import axios from 'axios'
import spacetime from 'spacetime'

import {
  Avatar,
  Box,
  Card,
  Flex,
  Inline,
  Label,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from '@sanity/ui'
import { TransferIcon } from '@sanity/icons'

import DeployStatus from './deploy-status'

const DeployHistory = ({ appId, token }) => {
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(true)

  useEffect(() => {
    setLoading(true)

    axios
      .get(`https://api.digitalocean.com/v2/apps/${appId}/deployments`, {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => {
        console.log('data', data)
        setDeployments(data.deployments)
        setLoading(false)
        setError(undefined)
      })
      .catch((e) => {
        setError(true)
        setLoading(false)
        console.warn(e)
      })
  }, [])

  if (loading) {
    return (
      <Flex direction="column" align="center" justify="center" paddingTop={3}>
        <Spinner size={4} />
        <Box padding={4}>
          <Text size={2}>loading deployment history...</Text>
        </Box>
      </Flex>
    )
  }

  if (error) {
    return (
      <Card padding={4} radius={2} shadow={1} tone="critical">
        <Text size={2} align="center">
          Could not load deployments
        </Text>
      </Card>
    )
  }

  return (
    <Box as={'ul'} padding={0}>
      <Card as={'li'} padding={4} borderBottom>
        <Flex>
          <Box flex={3}>
            <Label muted>Preview URL</Label>
          </Box>
          <Box flex={1} marginLeft={2}>
            <Label muted>State</Label>
          </Box>
          <Box flex={2} marginLeft={2}>
            <Label align="right" muted>
              Deployed At
            </Label>
          </Box>
        </Flex>
      </Card>

      {deployments?.map((deployment) => (
        <Card key={deployment.id} as={'li'} padding={4} borderBottom>
          <Flex align="center">
            <Box flex={3}>
              <Text weight="semibold">
                <Box
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <a
                    href={`https://cloud.digitalocean.com/apps/${appId}/deployments/${deployment.id}`}
                    target="_blank"
                    style={{ color: 'inherit' }}
                  >
                    deployment #{deployment.id}
                  </a>
                </Box>
              </Text>
            </Box>
            <Box flex={1} marginLeft={2}>
              <Text>
                <DeployStatus status={deployment.phase} />
              </Text>
            </Box>
            <Flex flex={2} justify="right" marginLeft={2}>
              <Inline space={2}>
                <Text style={{ whiteSpace: 'nowrap' }} muted>
                  {
                    spacetime.now().since(spacetime(deployment.created_at))
                      .rounded
                  }
                </Text>
              </Inline>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Box>
  )
}

export default DeployHistory
