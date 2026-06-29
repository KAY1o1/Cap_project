export default defineContentScript({
    matches: ['*://*.youtube.com/*'],
    main(ctx){
        console.log('Welcome to younote!');
    },
});