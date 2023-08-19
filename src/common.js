const core = require("@actions/core"); // https://github.com/actions/toolkit/tree/main/packages/core
const exec = require("@actions/exec"); // https://github.com/actions/toolkit/tree/main/packages/exec
const process = require("process");

// read action inputs
const input = {
  run: core.getInput('run'),
  post: core.getInput('post', {required: true}),
  workingDirectory: core.getInput('working-directory'),
  shell: core.getInput('shell'),
  postShell: core.getInput('post-shell'),
};

export async function run() {
  return runCommand(input.run, input.shell)
}

export async function post() {
  return runCommand(input.post, input.postShell ? input.postShell : input.shell)
}

/**
 * @param {String} command
 * @param {String[]} shell
 */
async function runCommand(command, shell) {
  /** @type {import('@actions/exec/lib/interfaces').ExecOptions} */
  const options = {
    cwd: input.workingDirectory,
    env: process.env,
    silent: true,
    listeners: {
      stdline: (data) => core.info(data),
      errline: (data) => core.info(data),
    },
  }

  return (async () => {
    if (command !== "") {
      core.info(`\x1b[1m$ ${command}\x1b[0m`)

      let exitCode = shell === ""
        ? await exec.exec(command, [], options)
        : await exec.exec(shell, ['-c', command], options)

      if (exitCode !== 0) {
        core.setFailed(`Command failed with exit code ${exitCode}`)
      }
    }
  })().catch(error => core.setFailed(error.message))
}
