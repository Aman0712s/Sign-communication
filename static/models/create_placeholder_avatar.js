// Run this in browser console to create a simple avatar
function createPlaceholderAvatar() {
    const geometry = new THREE.BoxGeometry(1, 2, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x22c55e });
    const avatar = new THREE.Mesh(geometry, material);
    return avatar;
}