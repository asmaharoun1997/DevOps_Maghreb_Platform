output "public_ips" {
  value = { for k, v in azurerm_public_ip.node : k => v.ip_address }
}

output "private_ips" {
  value = { for k, v in local.nodes : k => v.ip }
}

