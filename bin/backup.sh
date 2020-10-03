#!/bin/bash
PGPASSWORD="${3}" ${1} > ~/storage/backups/${2}
