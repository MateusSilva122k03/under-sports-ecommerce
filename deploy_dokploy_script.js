const DOKPLOY_URL = 'https://dokploy.recarga8.shop';
const TOKEN = 'or_gnPwCsbeqhhLMdMQJzRoYtFlxsXwlpJhaVhFUkNPnOYCxXyQGDaBKbYNkCSzgTaMPU';
const HEADERS = {
  'x-api-key': TOKEN,
  'Content-Type': 'application/json'
};

async function createDokployDeploy() {
  try {
    const projectId = "tvA71ZpyqPOMNv7F9Tw3i";
    const environmentId = "ib9tpYDhXDGumDk3DHR3G";
    const composeId = "D5_PtEMmACWwDQZcmYsbV"; // The one we just created
    console.log(`Working with Compose ID: ${composeId}`);

    // 3. Setup Github Repository
    console.log('Updating compose source to Github...');
    const upRes = await fetch(`${DOKPLOY_URL}/api/trpc/compose.update`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ json: {
         composeId,
         composeType: 'docker-compose',
         sourceType: 'github',
         repository: 'under-sports-ecommerce',
         owner: 'MateusSilva122k03',
         branch: 'main',
         composePath: './docker-compose.yml'
      }})
    });
    console.log('Update Source Response:', await upRes.text());

    // 5. Deploy Compose
    console.log('Triggering Deploy...');
    const depRes = await fetch(`${DOKPLOY_URL}/api/trpc/compose.deploy`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ json: { composeId } })
    });
    console.log('Deploy Response:', await depRes.text());

    console.log('✅ DEPLOY TRIGGERED SUCCESSFULLY!');

  } catch (err) {
    console.error(err);
  }
}

createDokployDeploy();
