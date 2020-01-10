# Chainlink External Adapter for Synthetix's Index (Coingecko)

This adapter pulls the indexes for Synthetix's index synths, retrieves the current market price for each asset from 
Coingecko, and calculates a weighted index.

## Install

```bash
yarn install
```

## Test

```bash
yarn test
```

## Create the zip

```bash
zip -r cl-synth-index-coingecko.zip .
```

## Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `cl-synth-index-coingecko.zip` file
- Handler should remain index.handler
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save


## Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `cl-synth-index-coingecko.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key
