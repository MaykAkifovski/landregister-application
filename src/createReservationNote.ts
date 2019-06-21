/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {FileSystemWallet, Gateway} from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

const ccpPath = path.resolve(__dirname, '..', '..', 'landregister-network', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('notary_1');
        if (!userExists) {
            console.log('An identity for the user "notary_1" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity: 'notary_1', discovery: {enabled: false}});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('landregister');

        // InitLedger
        const reservationNoteRequest = '{' +
            '  "docType": "landRegister",' +
            '  "inventoryRegister": {' +
            '    "economicType": "Hof- und Gebaeudeflaeche",' +
            '    "hall": "4",' +
            '    "location": "Steencamp 112",' +
            '    "parcel": "6/12",' +
            '    "size": "845 m2",' +
            '    "subdistrict": "Malente"' +
            '  },' +
            '  "owners": [' +
            '    {' +
            '      "city": "Berlin",' +
            '      "dateOfBirth": "17.06.1955",' +
            '      "firstname": "Reiner",' +
            '      "identityNumber": "1",' +
            '      "lastname": "Schatz",' +
            '      "postcode": "10***",' +
            '      "street": "Street",' +
            '      "streetnumber": "123",' +
            '      "title": "Mr"' +
            '    },' +
            '    {' +
            '      "city": "a",' +
            '      "dateOfBirth": "16.07.1956",' +
            '      "firstname": "Monika",' +
            '      "identityNumber": "2",' +
            '      "lastname": "Schatz",' +
            '      "postcode": "10***",' +
            '      "street": "Street",' +
            '      "streetnumber": "123",' +
            '      "title": "Mrs"' +
            '    }' +
            '  ],' +
            '  "titlePage": {' +
            '    "districtCourt": "asd",' +
            '    "landRegistryDistrict": "Malente",' +
            '    "sheetNumber": "3323"' +
            '  }' +
            '}';
        const result = await contract.submitTransaction('createReservationNote', reservationNoteRequest);
        console.log(`Transaction has been submitted, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
