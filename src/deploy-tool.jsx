import { definePlugin } from 'sanity'
import { route } from 'sanity/router'

import { default as deployIcon } from './deploy-icon'
import DigitalOceanDeploy from './digitalocean-deploy'

export const digitalOceanDeployTool = definePlugin((options) => {
  const { name, title, icon, ...config } = options || {}

  return {
    name: 'sanity-plugin-digital-ocean-deploy',
    tools: [
      {
        name: name || 'digital-ocean-deploy',
        title: title || 'Deploy',
        icon: icon || deployIcon,
        component: DigitalOceanDeploy,
        options: config,
        router: route.create('/*'),
      },
    ],
  }
})
