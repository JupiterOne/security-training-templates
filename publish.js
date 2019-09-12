'use strict';

const JupiterOneClient = require('@jupiterone/jupiterone-client-nodejs');
const fs = require('fs');
const yaml = require('js-yaml');

const {
  J1_USER_POOL_ID: poolId,
  J1_CLIENT_ID: clientId,
  J1_ACCOUNT_ID: account,
  J1_API_TOKEN: accessToken,
  J1_USERNAME: username,
  J1_PASSWORD: password
} = process.env;

const RECORDS_DIRECTORY = './records';

function parse(file) {
  try {
    const data = fs.readFileSync(file, "utf8");
    if (
      file.toLowerCase().endsWith(".yml") ||
      file.toLowerCase().endsWith(".yaml")
    ) {
      return yaml.safeLoad(data);
    } else {
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(err);
    return null;
  }
}

function getTime(time) {
  return time ? new Date(time).getTime() : undefined;
}

async function createEntity(j1Client, e) {
  const classLabels = Array.isArray(e.entityClass)
    ? e.entityClass
    : [e.entityClass];

  e.properties.createdOn = e.properties.createdOn
    ? new Date(e.properties.createdOn).getTime()
    : new Date().getTime();

  const res = await j1Client.createEntity(
    e.entityKey,
    e.entityType,
    classLabels,
    e.properties
  );
  return res.vertex.entity._id;
}

async function queryPerson(j1Client, email) {
  const query = `Find Person with email='${email}'`;
  const res = await j1Client.queryV1(query);
  if (res && res.length === 1) {
    return res[0].entity._id;
  } else {
    return null;
  }
}

async function createRecord(j1Client, {
  trainingEntityId,
  personEntityId,
  completedOn
}) {
  const properties = { completedOn };
  const res = await j1Client.createRelationship(
    `${personEntityId}|completed_training|${trainingEntityId}`,
    'person_completed_training',
    'COMPLETED',
    personEntityId,
    trainingEntityId,
    properties
  );
  return res.edge.relationship._id;
}

async function main() {
  const j1Client =
    await (new JupiterOneClient(
      { account, username, password, poolId, clientId, accessToken }
    )).init();

  const filenames = fs.readdirSync(RECORDS_DIRECTORY);

  for (const filename of filenames) {
    const training = parse(`${RECORDS_DIRECTORY}/${filename}`);
    const trainingEntityId = await createEntity(j1Client, training.entity);

    if (trainingEntityId) {
      for (const record of training.records || []) {
        const personEntityId = await queryPerson(j1Client, record.userEmail);

        if (personEntityId) {
          await createRecord(j1Client, {
            trainingEntityId, 
            personEntityId, 
            completedOn: getTime(record.completedOn)
          })
        }
      }
    }
  }
}

main();