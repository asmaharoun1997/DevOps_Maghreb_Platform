# ansible/ — Phases 3 à 12 : configuration et déploiement

Configure les VM et déploie tout le reste, sans action manuelle.

À contenir :
- `inventory.ini` (master, workers) — généré ou rempli à partir des sorties Terraform
- les playbooks : préparation des nœuds (containerd, kubeadm, kubelet, kubectl), création du cluster,
  serveur et clients NFS, déploiement de l'application, supervision, logs, backup etcd, runner GitLab
- les secrets dans un fichier chiffré avec Ansible Vault (le mot de passe du vault n'est jamais commité)
