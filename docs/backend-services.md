# Backend dependencies and architecture

The application is built as a single page web app that can run without its own dedicated backend. This is useful for
hosting it with a very simple, static host, like github pages. The server serves the static web content and the frontend
calls the [JW Player Delivery API](https://developer.jwplayer.com/jwplayer/docs) directly.
However, for additional functionality, the application can also connect to other backends to provide user
accounts / authentication, subscription management, and checkout flows. 

## OTT Firebase API

This API is a lightweight demo backend built to support the minimal backend functions, such as auth and content
protection that can't be done through the frontend alone. It primarily uses Firebase / Google cloud Cloud Run.

1)s [Enable billing](https://cloud.google.com/billing/docs/how-to/manage-billing-account) on your firebase project (note that there is a free tier for these services, but they still require
   you to enable billing.)
2) Install the gcloud cli: https://cloud.google.com/sdk/docs/install
3) Use [scripts/setupAuth.sh](scripts/setupAuth.sh) to setup the github authentication for your project. Remeber to provide the REPO and PROJECT_ID environment variables. 
4) Enable the Cloud Run API for your project: https://console.cloud.google.com/apis/library/run.googleapis.com?project=_
5) Enable the Artifact Registry API: https://console.cloud.google.com/flows/enableapi?apiid=artifactregistry.googleapis.com&redirect=https://cloud.google.com/artifact-registry/docs/docker/quickstart
6) 


## Roles and Functions

The available backend integrations serve 3 main roles, Accounts, Subscription, and Checkout. Below are the methods
that any backend integration needs to support broken down by role:

- [Account](../src/services/account.service.ts)
  - login
  - register
  - getPublisherConsents
  - getCustomerConsents
  - resetPassword
  - changePassword
  - updateCustomer
  - updateCustomerConsents
  - getCustomer
  - refreshToken
  - getLocales
  - getCaptureStatus
  - updateCaptureAnswers
- [Subscription](../src/services/subscription.service.ts)
  - getSubscriptions
  - updateSubscription
  - getPaymentDetails
  - getTransactions
- [Checkout](../src/services/checkout.service.ts)
  - getOffer
  - createOrder
  - updateOrder
  - getPaymentMethods
  - paymentWithoutDetails
  - paymentWithAdyen
  - paymentWithPayPal

## Existing Configurations

### Cleeng (https://developers.cleeng.com/docs)

The OTT Web App was initially built around Cleeng, and Cleeng is an all-in-one platform that provides support for all of the 3 functional roles above. For configuration options see [configuration.md](configuration.md)

