/**
 *
 * @param {Node} node
 * @param {function} foo
 */
export default function textWalk(node, foo) {
    if (node.nodeType === Node.TEXT_NODE) {
        foo(node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        let c = node.firstChild;
        while (c) {
            const next = c.nextSibling;
            textWalk(c, foo);
            c = next;
        }
    }
}
