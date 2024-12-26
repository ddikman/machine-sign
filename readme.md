# MakerSpace Machine Sign

This is a React-only fork of the [makerspace machine-sign](https://github.com/makerspace/machine-sign) repository.

Hosted at https://machinesign.greycastle.se

This project *can* be hosted on Github Pages directly without a custom url but it requires a lot more configuration of urls so using a custom url is recommended.

![App example screenshot](./example-screenshot.png)

## Running

```shell
yarn install
yarn dev
```

## SPA configuration

Since this is a React SPA (single page application), we need to GitHub pages to direct any url to open with the index.html file.

This is done in the [deploy.yaml](.github/workflows/deploy.yaml) very simply by providing a `404.html` which is a copy of the `index.html` file.