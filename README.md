# my-first-cloudflare-kv-project

A simple Cloudflare Worker that persists user data using Workers KV 🔑 💽

The requests IP is used as a rudimentray way of allowing users to see just their own todos. This is achieved by checking the `CF-Connecting-IP` header.

You can view the deployed demo at https://my-first-cloudflare-kv-project.simongreen.dev

If you'd like to build this project yourself checkout [this tutorial on Building data drive applications with Workers and Workers KV](https://egghead.io/courses/build-data-driven-applications-on-the-edge-with-workers-and-workers-kv-4932f3ea)
