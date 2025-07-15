/**
 * Programatically trigger focus then keydown enter keyboard
 * @param element : string | HTMLElement (input, textarea)
 */
export const triggerFocusEnter = (element: string | any) => { // HTMLElement
  let node = typeof element === 'string' ? document.querySelector(element) : element;

  if(node){
    node.focus();

    // dispatch the event on some DOM element
    node.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
    }));
  }
}
