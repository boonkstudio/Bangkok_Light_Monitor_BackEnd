module.exports = {
  apps: [{
    name: 'BLMB',
    script: 'bin/www',
    instances: 1,
    exec_mode: 'cluster',
  }],
};
