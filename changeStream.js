
const { MongoClient, ObjectId } = require('mongodb');

async function main() {

    const uri = "mongodb://localhost:27017/"

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const collection = client.db("sample_airbnb").collection("listingsAndReviews");
        let docid = new ObjectId('6229a0e6f7993fbc6a944c9e');
        let cond = streamConditionCreationFunction([['bedrooms', '<=', 2]])
        const changeStreamIterator = collection.watch([
            { $match: cond }
        ], { fullDocument: 'updateLookup' })

        while (true) {
            let change = await changeStreamIterator.next();
            console.log(change)
        }

        changeStreamIterator.close()

    } finally {
        await client.close();
    }
}

function streamConditionCreationFunction(conditionArray) {
    const crsa = {
        //CONDITION REPLACEMENT SYMBOLS ARRAY
        '=': 'eg',
        '<': 'lt',
        '>': 'gt',
        '<=': 'lte',
        '>=': 'gte',
        '!=': 'ne',
        'in': 'in',
        'nin': 'nin'
    }
    let conditionObj = {}
    conditionArray.forEach(each => {
        if (each[1] === '=') {
            let key = `fullDocument.${each[0]}`
            conditionObj[key] = each[2]
        } else {
            let key = `fullDocument.${each[0]}`
            let condition = crsa[each[1]]
            let cs = `\$${condition}`
            let co = {}
            co[cs] = each[2]
            conditionObj[key] = co
        }
    })
    return conditionObj
}

main().catch(console.error);