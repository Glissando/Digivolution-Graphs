class node {
    constructor(verts){
        this.verts = verts;

    }

    BFS(){
        var neighbours = [];
        for(var v of this.verts) {
            v.BFS();
        }
    }
}