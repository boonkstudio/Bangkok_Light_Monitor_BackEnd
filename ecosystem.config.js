module.exports = {
  apps: [{
    script: 'bin/www',
    instances: 4,
    // instances: 'max',
    exec_mode: 'cluster',
  }],

  // deploy: {
  //   production: {
  //     user: 'herk',
  //     host: 'SSH_HOSTMACHINE',
  //     ref: 'origin/master',
  //     repo: 'GIT_REPOSITORY',
  //     path: 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': '',
  //   },
  // },
};
