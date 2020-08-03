const fs = require('fs')
const { JSDOM } = require('jsdom')

const forsythRecipesHTML = fs.readFileSync('data/forsythrecipes.html', 'utf8')
const document = new JSDOM(forsythRecipesHTML).window.document

const allDivTags = document.getElementsByTagName('div')
const predefinedCategories = [
    "Bread",
    "Breakfast",
    "Cakes",
    "Cookies",
    "Dessert Breads",
    "Desserts",
    "Drinks",
    "Kid Stuff",
    "Main Dishes",
    "Mark the Chef",
    "Misc.",
    "Salads",
    "Soups",
    "Snacks",
    "Valencia Recipes",
    "Vegetables",
    "Unfood recipes",
    "Recipes to Try: Approval Pending"
]

let recipesByTitle = {}
let categoriesByName = {}

for (let d = 0; d < allDivTags.length; d++) {
    let currentDivTag = allDivTags[d]
    
    if (currentDivTag.hasAttribute('creator')) {
        let recipe = {
            title: currentDivTag.getAttribute('title'),
            body: currentDivTag.innerHTML.substring(
                currentDivTag.innerHTML.lastIndexOf('<pre>') + 5,
                currentDivTag.innerHTML.lastIndexOf('</pre>')
            )
            .replace(/&amp;/g, '&'),
            creator: currentDivTag.getAttribute('creator'),
            created: currentDivTag.getAttribute('created'),
            modified: currentDivTag.getAttribute('modified')
        }
    
        if (predefinedCategories.includes(recipe.title)) {
            let recipesInCategory = []
    
            let allLinesInRecipeBody = recipe.body.trim().split('\n')
            allLinesInRecipeBody.forEach(line => {
                let title = line.substring(
                    line.lastIndexOf("[[") + 2, 
                    line.lastIndexOf("]]")
                );
    
                recipesInCategory.push(title)
            })
    
            categoriesByName[recipe.title] = {
                name: recipe.title,
                recipeTitles: recipesInCategory
            }
        } else {
            recipesByTitle[recipe.title] = recipe
        }
    }
}

for (let c in categoriesByName) {
    let category = categoriesByName[c]

    category.recipeTitles = category.recipeTitles.filter(recipeTitle => {
        if (Object.keys(recipesByTitle).includes(recipeTitle)) {
            return recipeTitle
        }
    })
}

fs.writeFileSync('../forsyth-recipes-with-links/data/recipes.json', JSON.stringify(recipesByTitle))
fs.writeFileSync('../forsyth-recipes-with-links/data/categories.json', JSON.stringify(categoriesByName))