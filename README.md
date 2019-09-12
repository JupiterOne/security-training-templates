# Security Training Templates

Contains examples of lightweight security training built with
[WebSlides](https://webslides.tv/).

Currently including the following:

- HIPAA Security and Privacy [live example](https://security.lifeomic.com/training/hipaa)

## Publish Training Record to JupiterOne

You can create training records in YAML and publish them to your JupiterOne (J1)
account.

See `records/hipaa.yaml` for example training entity and records. The file has
two parts:

- `entity`: has all properties needed to create a `Training` entity in J1
- `records`: contains an array of training completion records, each has an
  `userEmail` and a `completedOn` date/timestamp.

You will need to create a `.env` file that contains the following environment
variables specific to your J1 account:

```
J1_ACCOUNT_ID=
J1_API_TOKEN=
```

Alternatively, instead of using an API token, you can also specify username and
password:

```
J1_ACCOUNT_ID=
J1_USERNAME=
J1_PASSWORD=
```

With that, run `yarn && yarn publish:j1`.

### Querying Training Records in JupiterOne

Once published, you can run a J1QL query in your JupiterOne account to generate
reports and/or visualization.

For example:

```j1ql
Find Person that completed hipaa_training return tree
```

![](j1-query-graph.png)

Here's a query to generate a report with records:

```j1ql
find Person as p
  that completed as r hipaa_training as t
return
  p.displayName, p.email, t.displayName, r.completedOn
```

## License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)