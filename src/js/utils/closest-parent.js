import matches from "./matches";

const native = !!Element.prototype.closest;

/**
 *
 * @param {Element|null} element
 * @param {string} selector
 * @param {boolean} [withSelf]
 * @return {Element|null}
 */
export default function closestParent(element, selector, withSelf = false) {
  if (element === null) return null;
  const p = withSelf ? element : element.parentNode;
  if (native && p) return p.closest(selector);

  if (p && p.nodeType == Node.ELEMENT_NODE) {
    return matches(p, selector) ? p : closestParent(p, selector);
  }
  return null;
}
