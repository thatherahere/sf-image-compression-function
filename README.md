# Compress Images with Salesforce Function using Node.js

## About

This Salesforce function convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions. It uses Sharp Node.js module to convert images of the most diverse formats and varied dimensions to a smaller size, without having to worry about the color space, channels and alpha transparency, because all of these are treated correctly.

https://user-images.githubusercontent.com/2828039/181612839-2156feb4-d25d-427d-81ff-dda7f5e832af.mp4


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

This sample function support jpg, jpeg and png compression. You can explore more options [here](https://sharp.pixelplumbing.com/api-output).

### Deploy and configure the Salesforce Function

#### Deploy source to org:
1. Clone the repository:

   ```sh
   git clone https://github.com/thatherahere/sf-image-compression-function.git
   cd sf-image-compression-function
   ```

1. Login to your Salesforce Function trail Org.

1. Deploy code to your trail org:

   ```sh
   sfdx force:source:deploy -x manifest/package.xml -l RunSpecifiedTests -r ContentDocumentLinkTriggerTest
   ```
#### Function Deployment to compute environment:
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

1. Open the org:
   ```sh
   sfdx force:org:open
   ```
1. Navigate to Contacts tab --> Open any Contact record --> Navigate to related list --> Files/Notes & Attachments related list --> Upload image using Upload Files button --> Compare the file size and quality after upload.

## Troubleshooting

1. While creating the compute environment if you see below error, Check your sfdx-project.json at the root level. The name of the project must not have -. Please change it to underscore and it should work.

   ```
   Creating compute environment for org ID 00DXXXXXXXXXXXXXXX... failed
   Error: Request failed with status code 422
   ```

1. Monitor Salesforce Function's logs by running:

   ```sh
   sf env log tail -e stimgenv
   ```

1. Monitor Salesforce logs by running:

   ```sh
   sfdx force:apex:log:tail -c
   ```

## Best Practice

Release the Compute Environments: If you no longer need a compute environment, or you wish to disconnect a connected org, use the sf env delete command with the compute environment alias to remove the compute environment and let someone else use these resources for practice :) :

```sh
sf env delete -e stimgenv
```
