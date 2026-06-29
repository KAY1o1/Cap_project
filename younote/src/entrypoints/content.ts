export default defineContentScript({
    matches: ['https://www.youtube.com/'],
    main(ctx){
        console.log('Welcome to younote!');
    },
});