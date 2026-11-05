# terraform/ — Phase 2 : infrastructure Azure

Crée automatiquement le réseau et les 3 VM (master, worker1, worker2) dans le Resource Group fourni.

À contenir :
- `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`
- `terraform.tfvars.example` (le vrai `terraform.tfvars` n'est jamais commité)

Règles :
- le Resource Group `rg-formation-asma` est lu avec un bloc `data` (jamais créé ni détruit par Terraform)
- toutes les ressources sont préfixées (`asma-…`)
- aucune modification manuelle dans le portail Azure
