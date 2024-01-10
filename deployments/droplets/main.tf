terraform {
  required_version = ">= 1.0.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = ">= 2.0.0"
    }
  }
}

provider "digitalocean" {}

resource "digitalocean_droplet" "server-api" {
  image     = "ubuntu-23-10-x64"
  name      = "server-api"
  region    = "BLR1"
  size      = "s-1vcpu-1gb"
  user_data = file("server-api.yaml")
}