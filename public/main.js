function greet(age){
    this.name = "monu"
    console.log(this.name)
    this.age += age
    console.log(this.age)
}

const obj = {
    name : "mayank",
    age : 22
}

greet.call(obj,5)

// in call we just pass object to that function means we give refernce of that object and in apply extra
// argument just give in array and there is no difference betweem apply and call

function greet2(age){
    this.name = "monu"
    console.log(this.name)
    this.age += age
    console.log(this.age)
}

const obj2 = {
    name : "mayank",
    age : 22
}

greet2.apply(obj2,[5])

// and bind will also do same but bing will return the reference of that function and we can that function
// whenever we needed that at that time it will change the values in bind we can pass argument as array or
// normal

function greet3(age){
    this.name = "monu"
    console.log(this.name)
    this.age += age
    console.log(this.age)
}

const obj3 = {
    name : "mayank",
    age : 22
}

const s = greet3.bind(obj3,5)
console.log(s)
ggggg

