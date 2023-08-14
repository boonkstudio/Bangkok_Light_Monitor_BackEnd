module.exports = {
  apps: [{
    name: 'api-test',
    script: 'bin/www',
    instances: 1,
    exec_mode: 'cluster',
  }],
};
