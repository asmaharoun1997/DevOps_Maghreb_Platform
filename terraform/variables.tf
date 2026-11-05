variable "subscription_id" {
  description = "Identifiant de la souscription Azure"
  type        = string
}

variable "resource_group_name" {
  description = "Groupe de ressources fourni par l'école (existant, non géré par Terraform)"
  type        = string
  default     = "rg-formation-asma"
}

variable "vm_size" {
  description = "Taille des VM du cluster (limitée par la policy de l'école)"
  type        = string
  default     = "Standard_B2s"
}

variable "vnet_name" {
  description = "Réseau existant créé avec la control node (bootstrap/create-control-node.sh)"
  type        = string
  default     = "asma-control-nodeVNET"
}

variable "ssh_public_key_path" {
  description = "Clé publique SSH déposée sur les VM du cluster"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "location" {
  description = "Région Azure du cluster (quota des VM B2s disponible)"
  type        = string
  default     = "germanywestcentral"
}
