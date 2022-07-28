# Compress Images with Salesforce Function using Node.js

## About

This Salesforce function convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions. It uses Sharp Node.js module to convert images of the most diverse formats and varied dimensions to a smaller size, without having to worry about the color space, channels and alpha transparency, because all of these are treated correctly.

## Installation

### Prerequisites

#### Salesforce Resources

1. [Sign up for a Salesforce Functions trial org](https://functions.salesforce.com/signups/).
1. [Enable Dev Hub](https://help.salesforce.com/s/articleView?id=sf.sfdx_setup_enable_devhub.htm&type=5) in your org.
1. [Install the Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).
1. [Authorize](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_auth.htm) your Dev Hub in the Salesforce CLI.
1. [Get Started | Salesforce Functions](https://developer.salesforce.com/docs/platform/functions/guide/index.html)

#### sharp - High performance Node.js image processing

[Sharp](https://sharp.pixelplumbing.com/) is high speed Node.js module to convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions. Colour spaces, embedded ICC profiles and alpha transparency channels are all handled correctly. Lanczos resampling ensures quality is not sacrificed for speed.

As well as image resizing, operations such as rotation, extraction, compositing and gamma correction are available.

### Deploy and configure the Salesforce Function

You execute the function by either [deploying to a compute environement](#deploy-to-compute-environment) or [run locally](#run-locally).

<!--Make sure to refer to the relevant section and check the [environment variables reference](#environment-variables-reference) section for the appropriate configuration.-->

#### Deploy to compute environment

Follow these steps to deploy your function to a compute environment:

1. Log in to Salesforce Functions (you may have to repeat this command later as this will eventually time out)

   ```sh
   sf login functions
   ```

1. Create a compute environment:

   ```sh
   sf env create compute -o sf_img_prcess_org -a stimgenv
   ```

1. Deploy the Salesforce Function:

   ```sh
   cd functions/sfimagecompression
   sf deploy functions -o sf_img_prcess_org
   ```

1.

#### Run locally

Follow these steps to test your function locally:

1. Create a `.env` file in the `functions/sftwiliosms` directory. Use the following template and make sure to replace values accordingly:

   ```properties
   TWILIO_ACCOUNT_SID=XXXXXXXXXX
   TWILIO_AUTH_TOKEN=XXXXXXXXXX
   FROM_NUMBER=XXXXXXXXXX
   ```

1. Prepare the JSON payload. You can pass the payload inline or create a payload.json file in your function directory with a verified number and SMS body as:

   ```json
   {
     "toNumber": "[VERIFIED_NUMBER]",
     "smsBody": "This SMS was sent via Salesforce Function."
   }
   ```

1. Run these commands to start the function locally:

   ```sh
   cd functions/sftwiliosms
   sf run function start
   ```

1. Navigate to your project root directory and invoke the function as:
   ```sh
   sf run function -l http://localhost:8080 -p '@functions/sftwiliosms/payload.json'
   ```

#### Environment variables reference

| Variable Name        | Description                        |
| -------------------- | ---------------------------------- |
| `TWILIO_ACCOUNT_SID` | Your twilio account's Account SID. |
| `TWILIO_AUTH_TOKEN`  | Your twilio account's Auth Token . |
| `FROM_NUMBER`        | Your Twilio phone number           |

## Troubleshooting

1. While creating the compute environment if you see below error, Check your sfdx-project.json at the root level. The name of the project must not have -. Please change it to underscore and it should work.

   ```
   Creating compute environment for org ID 00DXXXXXXXXXXXXXXX... failed
   Error: Request failed with status code 422
   ```

1. Monitor Salesforce Function's logs by running:

   ```sh
   sf env log tail -e stenv
   ```

1. Monitor Salesforce logs by running:

   ```sh
   sfdx force:apex:log:tail -c
   ```

## Best Practice

Release the Compute Environments: If you no longer need a compute environment, or you wish to disconnect a connected org, use the sf env delete command with the compute environment alias to remove the compute environment and let someone else use these resources for practice :) :

```sh
sf env delete -e stenv
```
