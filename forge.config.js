/**
 * REFERENCES:
 * https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging
 * https://electron.github.io/packager/main/interfaces/Options.html#executableName
 * https://js.electronforge.io/interfaces/_electron_forge_maker_dmg.MakerDMGConfig.html
 */
module.exports = {
  packagerConfig: {
    // name: 'Time Log',
    // executableName: 'Time Log',
    // executableName: 'timelog',
    icon: './app/baseline_work_history_blue_36dp',
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-zip',
    //   platforms: ['darwin'],
    // },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        // background: 'assets/dmg_background.png',
        format: 'ULFO',
      }
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
};
