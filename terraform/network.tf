# --- Ressources qui existent déjà : Terraform les lit, il ne les crée pas ---
data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

# Réseau de la control node (northeurope), créé par bootstrap/create-control-node.sh
data "azurerm_virtual_network" "control" {
  name                = var.vnet_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

# --- Réseau du cluster, dans la région où le quota B2s est disponible ---
resource "azurerm_virtual_network" "cluster" {
  name                = "asma-cluster-vnet"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.rg.name
  address_space       = ["10.1.0.0/16"]
}

resource "azurerm_subnet" "cluster" {
  name                 = "asma-cluster-subnet"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.cluster.name
  address_prefixes     = ["10.1.1.0/24"]
}

resource "azurerm_network_security_group" "cluster" {
  name                = "asma-cluster-nsg"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.rg.name

  security_rule {
    name                       = "allow-nodeport"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "30000-32767"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "cluster" {
  subnet_id                 = azurerm_subnet.cluster.id
  network_security_group_id = azurerm_network_security_group.cluster.id
}

# --- Peering : relie les deux réseaux (dans les deux sens) ---
resource "azurerm_virtual_network_peering" "control_to_cluster" {
  name                         = "control-to-cluster"
  resource_group_name          = data.azurerm_resource_group.rg.name
  virtual_network_name         = data.azurerm_virtual_network.control.name
  remote_virtual_network_id    = azurerm_virtual_network.cluster.id
  allow_virtual_network_access = true
}

resource "azurerm_virtual_network_peering" "cluster_to_control" {
  name                         = "cluster-to-control"
  resource_group_name          = data.azurerm_resource_group.rg.name
  virtual_network_name         = azurerm_virtual_network.cluster.name
  remote_virtual_network_id    = data.azurerm_virtual_network.control.id
  allow_virtual_network_access = true
}
