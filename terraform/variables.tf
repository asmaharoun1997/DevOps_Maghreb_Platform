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
  default     = "Standard_D2s_v5"
}
