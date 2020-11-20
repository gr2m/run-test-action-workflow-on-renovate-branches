module.exports = deleteGreenkeeperBranches;

const yaml = require("js-yaml");
const prettier = require("prettier");

/**
 * Create a CODE_OF_CONDUCT.md file unless it already exists.
 * Ignores forks and archived repositories
 *
 * @param {import('@octokit/core').Octokit} octokit
 * @param {import('@octokit/types').Endpoints["GET /repos/:owner/:repo"]["response"]["data"]} repository
 * @param {object} options
 */
async function deleteGreenkeeperBranches(octokit, repository, options) {
  if (repository.archived) {
    octokit.log.info(`${repository.html_url} is archived, ignoring.`);
    return;
  }

  const owner = repository.owner.login;
  const repo = repository.name;
  const path = ".github/workflows/test.yml";

  const { data: testWorkflowContent } = await octokit
    .request("GET /repos/:owner/:repo/contents/:path", {
      owner,
      repo,
      path,
    })
    .catch(() => {
      return { data: false };
    });

  if (!testWorkflowContent) {
    octokit.log.info(`${path} does not exist`);
    return;
  }

  try {
    const settings = yaml.safeLoad(
      Buffer.from(testWorkflowContent.content, "base64")
    );

    if (!settings.on.push) {
      settings.on.push = { branches: [] };
    }
    if (!settings.on.push.branches) {
      settings.on.push.branches = [];
    }

    if (settings.on.push.branches.includes("renovate/**")) {
      octokit.log.info(
        `${testWorkflowContent.html_url} is already triggered by renovate branches`
      );
      return;
    }

    settings.on.push.branches.push("renovate/**");

    const content = prettier.format(yaml.safeDump(settings), {
      parser: "yaml",
    });

    const { data } = await octokit.request(
      "PUT /repos/:owner/:repo/contents/:path",
      {
        owner,
        repo,
        path,
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: testWorkflowContent.sha,
        message: `ci(test): enable builds for renovate branches
      
See https://github.com/semantic-release/.github/pull/6#issuecomment-731341027`,
      }
    );

    octokit.log.info("%s updated: %s", path, data.commit.html_url);
  } catch (error) {
    octokit.log.error(error);
  }
}
