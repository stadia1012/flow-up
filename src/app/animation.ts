// animation functions


export function flash(el : Element | null) {
  el?.animate([{
    backgroundColor: "#E9F2FF"
  }, {}], {
    duration: 500,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    iterations: 1,
    fill: 'forwards'
  });
}