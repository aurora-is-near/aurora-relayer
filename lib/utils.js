import jsSHA from 'jssha';
export function computeBlockHash(blockHeight, accountId, chainId) {
    const shaObj = new jsSHA('SHA-256', 'UINT8ARRAY');
    console.log(intToBinary(0), intToBinary(chainId), stringToBinary(accountId), intToBinary(blockHeight));
    shaObj.update(intToBinary(0)); // BLOCK_HASH_PREFIX
    shaObj.update(intToBinary(chainId));
    shaObj.update(stringToBinary(accountId));
    shaObj.update(intToBinary(blockHeight));
    return shaObj.getHash('HEX');
}
function stringToBinary(str) {
    return new Uint8Array(Buffer.from(str));
}
function intToBinary(int) {
    return (int >>> 0).toString(2);
}
