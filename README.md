# Ops-Whisperer 🌩️

The Infrastructure Translator: Turn natural language into Ops code. This CLI tool leverages GitHub Copilot to generate infrastructure configurations (like Dockerfiles, Kubernetes manifests, or Terraform files) based on your natural language descriptions.

## Features

*   **Natural Language to Code:** Describe the infrastructure you need in plain English, and Ops-Whisperer will generate the corresponding code.
*   **Multiple Infrastructure Types:** Supports generation for Docker, Kubernetes, Terraform and Bash.
*   **Interactive Execution:** Review the generated code and confirm execution before any changes are applied.
*   **Interactive Mode:** An interactive mode for a more guided experience.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/) (v14 or higher)
*   [GitHub Copilot CLI](https://github.com/github/copilot-cli)

## Installation

1.  Install the GitHub Copilot CLI by following the instructions [here](https://github.com/github/copilot-cli).
2.  Install Ops-Whisperer globally via npm:

```bash
npm install -g ops-whisperer
```

## Usage

### Interactive Mode

Run the `ops` command without any arguments to enter interactive mode.

```bash
ops
```

### Headless Mode

Run the `ops` command followed by a description of the infrastructure you want to create. You can specify the type of infrastructure using the `-t` or `--type` option.

```bash
# Generate a Dockerfile for a Node.js application
ops "a Dockerfile for a Node.js application with Express that listens on port 3000" --type docker

# Generate a Kubernetes deployment for a simple web server
ops "a Kubernetes deployment for an Nginx web server" --type k8s

# Generate Terraform code for an AWS S3 bucket
ops "Terraform code for an AWS S3 bucket configured for static website hosting" --type terraform

# Generate a bash command
ops "a bash command to list all the running docker containers" --type bash
```

## Contributing

Contributions are welcome ! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Author
 
*   **Name:** Salek Masud Parvez
*   **Email:** salekmasudparvez@gmail.com
