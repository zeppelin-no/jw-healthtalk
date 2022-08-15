#export REPO and PROJECT_ID are required

gcloud config set project $PROJECT_ID
gcloud iam service-accounts create "github-action-runner" \
  --project "${PROJECT_ID}"
  --display-name="Github Action Runner"

gcloud services enable iamcredentials.googleapis.com --project "${PROJECT_ID}"

gcloud iam workload-identity-pools create "github-action-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --display-name="Github Action Pool"

export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-action-pool" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)")

gcloud iam workload-identity-pools providers create-oidc "github-token-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github-action-pool" \
  --display-name="Github Token Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

gcloud iam service-accounts add-iam-policy-binding "github-action-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"

