# arora-api

Create the `postgres-auth` secret with:

```sh
kubectl create secret generic postgres-auth -n <namespace> --from-literal=postgres-password=<postgres_password> --from-literal=password=<password>
```

Create the `auth-keys` secret with:

```sh
kubectl create secret generic auth-keys -n <namespace> --from-file=private.key=private.key --from-file=public.key=public.key
```

Create the `roblox-auth` secret with:

```sh
kubectl create secret generic roblox-auth -n <namespace> --from-literal=api-key='<key>' --from-literal=cookie='<cookie>'
```

Install/upgrade with:

```sh
helm upgrade --install --debug --atomic -f charts/arora-api/values.yaml -n <namespace> arora-api charts/arora-api --set=ingressHost=<url>
```

The initial installation has to be done with the migration job disabled, add `--set hooks.dbMigrate.enabled=false`.

Port forward to the PostgreSQL service using:

```sh
kubectl port-forward -n <namespace> svc/arora-api-postgresql <host_port>:5432
```

Database restore instructions can be found at the [`postgres-backup` documentation](https://github.com/guidojw/maia/tree/main/postgres-backup).
