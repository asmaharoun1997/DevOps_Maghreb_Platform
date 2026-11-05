locals {
  nodes = {
    master  = { ip = "10.1.1.4" }
    worker1 = { ip = "10.1.1.5" }
    worker2 = { ip = "10.1.1.6" }
  }
}

resource "azurerm_public_ip" "node" {
  for_each            = local.nodes
  name                = "asma-${each.key}-pip"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.rg.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_network_interface" "node" {
  for_each            = local.nodes
  name                = "asma-${each.key}-nic"
  location            = var.location
  resource_group_name = data.azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.cluster.id
    private_ip_address_allocation = "Static"
    private_ip_address            = each.value.ip
    public_ip_address_id          = azurerm_public_ip.node[each.key].id
  }
}

resource "azurerm_linux_virtual_machine" "node" {
  for_each              = local.nodes
  name                  = "asma-${each.key}"
  location              = var.location
  resource_group_name   = data.azurerm_resource_group.rg.name
  size                  = var.vm_size
  admin_username        = "azureuser"
  network_interface_ids = [azurerm_network_interface.node[each.key].id]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file(pathexpand(var.ssh_public_key_path))
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  tags = {
    projet = "maghreb-platform"
    role   = each.key == "master" ? "control-plane" : "worker"
  }
}

resource "azurerm_dev_test_global_vm_shutdown_schedule" "node" {
  for_each              = local.nodes
  virtual_machine_id    = azurerm_linux_virtual_machine.node[each.key].id
  location              = var.location
  enabled               = true
  daily_recurrence_time = "1800"
  timezone              = "UTC"

  notification_settings {
    enabled = false
  }
}
