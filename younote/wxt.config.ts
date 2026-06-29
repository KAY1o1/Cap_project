import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modulesDir: 'wxt-modules',
  outDir: 'dist',
  publicDir: 'static',

  manifest:{
    name: 'youNote',
    description: 'A social note taking tool for YouTube.',
    version: '1.0.0',

  }

});
