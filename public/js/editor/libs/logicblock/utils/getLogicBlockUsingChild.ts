/**
 * This function retrieves the closest ancestor of a given HTML element that has the class "block-container".
 *
 * @param {HTMLElement} elem - The starting HTML element from which to search for an ancestor.
 * @returns {HTMLElement|null} The closest ancestor with the "block-container" class, or null if no such element exists.
 */

export default function getLogicBlockUsingChild(elem:HTMLElement) {
    let parentElement = elem.parentElement as null | undefined | HTMLElement ;
    let logicBlockClass = "block-container";
    while (parentElement && !parentElement.classList.contains(logicBlockClass)) {
      parentElement = parentElement?.parentElement;
    }
    return parentElement;
}
