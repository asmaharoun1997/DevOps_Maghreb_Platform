#!/bin/bash
# Crée la VM de pilotage (Terraform, Ansible, kubectl) dans le groupe de ressources existant.
# La policy de l'école n'autorise que certaines tailles (B2s, D2s_v5, ...).
az vm create \
  --resource-group rg-formation-asma \
  --name asma-control-node \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --tags projet=maghreb-platform role=control-node

az vm auto-shutdown --resource-group rg-formation-asma --name asma-control-node --time 1800
