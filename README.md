<h3 align="center">
  DigitalOcean Deployments for Sanity
</h3>

<p>
  This project is <s>shamelessly ripped off of</s> based on <a href="https://github.com/ndimatteo/sanity-plugin-vercel-deploy">sanity-plugin-vercel-deploy</a> by <a href="https://github.com/ndimatteo">Nick DiMatteo</a>.
</p>

<p align="center">
  <strong>Trigger DigitalOcean Deploy Hooks from your Sanity Studio.</strong><br />
✨ LIVE status updates ✨ multiple deployments ✨ active polling ✨
</p>

## Install

Run the following command in your studio folder using the Sanity CLI:

```sh
sanity install digitalocean-deploy
```

⚠️ **Note:** If your Studio is not using the `@sanity/dashboard` part, you'll need to manually install this as well:

```sh
sanity install @sanity/dashboard
```

<br />

## Your first DigitalOcean Deployment

Once installed, you should see a new "Deploy" tool in your Sanity Studio navbar.

To create a new deployment, click the `Add Project` button. Next, you'll be prompted to add the following:

**`Title`**

> A name for your deployment. This can be whatever you want, to help you organize your deployments. Typically, this should be the environment you are deploying to, like `Production` or `Staging`

<br />

**`Deploy App ID`**

> This is the DigitalOcean App ID you want to trigger.

<br />

**`API Token`**

> This is a token from your DigitalOcean Account (not project). TODO: directions

😎 Once you've created your deployment you can now trigger deploys at anytime!

<br />

## License

### MIT

# sanity-plugin-digitalocean-deploy
