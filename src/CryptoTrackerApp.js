import React, { useState, useEffect } from 'react';
import './index.css';
import axios from 'axios';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const CryptoTrackerApp = () => {
    const [cryptos, setCryptos] = useState([]);
    const [newPurchase, setNewPurchase] = useState({
        cryptoName: '',
        purchasePrice: 0,
        quantity: 0,
    });

    const token = ['bitcoin,ethereum,xrp,solana,binance-coin,cardano,avalanche,shiba-inu,tether,usd-coin,' +
    'pancakeswap,dent,holo,vechain,elrond-egld,okb,icon,harmony,' +
    'band-protocol,pundix-new,aleph-im,nexo,bitdao'];

    const apiKey = "coinranking0990dd0a3ad9319844ad267129e9f58cf39e24bc7a952a7f";

    useEffect(() => {
        const fetchCryptoData = async () => {
            try {
                const response = await axios.get('https://api.coinranking.com/v2/coins?' +
                    'uuids[]=U70EVFnDc6diV' +
                    '&uuids[]=7q5-b6CZQ' +
                    '&uuids[]=pxmVr52k2' +
                    '&uuids[]=gyeL8ikF4' +
                    '&uuids[]=Qwsogvtv82FCd' +
                    '&uuids[]=razxDUgYGNAdQ' +
                    '&uuids[]=-l8Mn2pVlRs-p' +
                    '&uuids[]=xz24e0BjL' +
                    '&uuids[]=zNZHO_Sjf' +
                    '&uuids[]=WcwrkfNI4FUAe' +
                    '&uuids[]=qzawljRxB5bYu' +
                    '&uuids[]=dvUj0CzDZ' +
                    '&uuids[]=HIVsRcGKkPFtW' +
                    '&uuids[]=aKzUVe4Hh_CON' +
                    '&uuids[]=ncYFcP709' +
                    '&uuids[]=4UM6MucwFvYex' +
                    '&uuids[]=FEbS54wxo4oIl' +
                    '&uuids[]=omwkOTglq' +
                    '&uuids[]=PDKcptVnzJTmN' +
                    '&uuids[]=XtW6kus088In' +
                    '&uuids[]=Hi6jNXshVh9FA' +
                    '&uuids[]=BoI4ux0nd' +
                    '&uuids[]=8yf0mbs5v' +
                    '&uuids[]=iEHCPwcxoIH8e' +
                    '&uuids[]=1I8eZONKt' +
                    '&uuids[]=PXokOyad2' +
                    '&uuids[]=md2dX_za1' +
                    '&uuids[]=18fMBjwXg' +
                    '&uuids[]=SPypnJP-O' +
                    '&uuids[]=pvdJdmebc' +
                    '&uuids[]=-H2b28Lhr' +
                    '&uuids[]=4LaXjGqn8' +
                    '&uuids[]=25W7FG7om' +
                    '&uuids[]=h8MlvevE8' +
                    '&uuids[]=YHFAxXTWe' +
                    '&uuids[]=ze0N2Rcyu' +
                    '&uuids[]=VXQXeb8DO' +
                    '&uuids[]=J8xX4Fc9PxEat' +
                    '&uuids[]=TpHE2IShQw-sJ' +
                    '&uuids[]=a91GCGd_u96cF' +
                    '&uuids[]=HqxY9fy7O',
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-access-token": "coinranking0990dd0a3ad9319844ad267129e9f58cf39e24bc7a952a7f",
                    },
                });

                const cryptoData = await Promise.all(
                    response.data.data.coins.map(async (crypto) => {
                        const purchasesQuery = query(
                            collection(db, 'purchases'),
                            where('cryptoName', '==', crypto.name)
                        );
                        const purchasesSnapshot = await getDocs(purchasesQuery);

                        let totalQuantity = 0;
                        let totalPrice = 0;

                        purchasesSnapshot.forEach((purchaseDoc) => {
                            const purchaseData = purchaseDoc.data();
                            totalQuantity += purchaseData.quantity;
                            totalPrice +=
                                purchaseData.purchasePrice * purchaseData.quantity;
                        });

                        const averagePurchasePrice =
                            totalQuantity > 0
                                ? totalPrice / totalQuantity
                                : 0;

                        await addDoc(collection(db, 'cryptos'), {
                            name: crypto.name,
                            symbol: crypto.symbol,
                            purchasePrice: averagePurchasePrice,
                            currentPrice: parseFloat(crypto.price),
                            quantity: totalQuantity,
                        });

                        const profitLoss = ((crypto.price - averagePurchasePrice) * totalQuantity)
                            .toFixed(2);
                        const profitColor = profitLoss >= 0 ? 'green' : 'red';
                        const changeColor = crypto.change >= 0 ? 'green' : 'red';
                        const currentValue = (crypto.price * totalQuantity).toFixed(2);
                        const purchaseValue = (averagePurchasePrice * totalQuantity).toFixed(2);
                        const purcentageOfLoP = (((currentValue - purchaseValue) / purchaseValue) * 100).toFixed(2) + '%';

                        return {
                            id: crypto.id,
                            name: crypto.name,
                            symbol: crypto.symbol,
                            change: crypto.change + '%',
                            changeColor: changeColor,
                            purchasePrice: averagePurchasePrice,
                            currentPrice: parseFloat(crypto.price),
                            quantity: totalQuantity,
                            purchaseValue: purchaseValue,
                            currentValue: parseFloat(currentValue),
                            profitLoss: profitLoss,
                            css: profitColor,
                            purcentage: purcentageOfLoP,
                        };
                    })
                );

                setCryptos(cryptoData);
            } catch (error) {
                console.error(
                    'Erreur lors de la récupération des données crypto:',
                    error
                );
            }
        };

        fetchCryptoData();
    }, []);

    const handleNewPurchaseChange = (field, value) => {
        setNewPurchase((prevPurchase) => ({
            ...prevPurchase,
            [field]: value,
        }));
    };

    const handleAddNewPurchase = async () => {
        const { cryptoName, purchasePrice, quantity } = newPurchase;

        if (cryptoName && purchasePrice !== '' && quantity !== '') {
            await addDoc(collection(db, 'purchases'), {
                cryptoName,
                purchasePrice: parseFloat(purchasePrice),
                quantity: parseFloat(quantity),
                timestamp: new Date(),
            });

            setNewPurchase({
                cryptoName: '',
                purchasePrice: '',
                quantity: '',
            });
        } else {
            alert('Veuillez remplir tous les champs du formulaire.');
        }
    };

    const columns = [
        { field: 'name', headerName: 'Crypto', sortable: true },
        { field: 'symbol', headerName: 'Symbole', sortable: true },
        { field: 'quantity', headerName: 'Quantité totale', sortable: true },
        { field: 'purchasePrice', headerName: 'Prix d\'achat moyen', sortable: true },
        { field: 'currentPrice', headerName: 'Cours actuel', sortable: true },
        { field: 'change', headerName: 'Change (24h)', sortable: true, cellClass: (row) => { return row.changeColor }},
        { field: 'purchaseValue', headerName: 'Valeur achat', sortable: true },
        { field: 'currentValue', headerName: 'Valeur actuelle', sortable: true },
        { field: 'profitLoss', headerName: 'Résultat', sortable: true, cellClass: (row) => { return row.css }},
        { field: 'purcentage', headerName: 'Résultat %', sortable: true, cellClass: (row) => { return row.css }},
    ];

    const totalProfitLoss = cryptos.reduce((acc, crypto) => {
        const totalPurchaseValue = crypto.purchasePrice * crypto.quantity;
        const currentTotalValue = crypto.currentPrice * crypto.quantity;
        const profitLoss = currentTotalValue - totalPurchaseValue;

        return acc + profitLoss;
    }, 0);

    const totalCryptoValue = cryptos.reduce(
        (acc, crypto) => acc + crypto.currentPrice * crypto.quantity,
        0
    );

    const totalPurchaseValue = cryptos.reduce(
        (acc, crypto) => acc + crypto.purchasePrice * crypto.quantity,
        0
    );

    return (
        <div>
            <h1 className="table-center">Crypto Tracker - Valeur Actuelle :{' '}
                 <span style={{ color: totalCryptoValue >= totalPurchaseValue ? 'green' : 'red' }}>
                     {totalCryptoValue.toFixed(2)}$
                 </span>
                <span> - Montant Investi : {totalPurchaseValue.toFixed(2)}$ {' - '}
                </span>
                <span style={{ color: totalProfitLoss >= 0 ? 'green' : 'red' }}>
                    G/P : {totalProfitLoss.toFixed(2)}$
                </span>
            </h1>
            <div className="ag-theme-alpine">
                <AgGridReact
                    columnDefs={columns}
                    rowData={cryptos}
                    domLayout='autoHeight'
                    defaultColDef={{
                        sortable: true,
                    }}
                />
            </div>

            <h2>Ajouter un nouvel achat : </h2>
            <div className="add">
                <div >
                    <label>Crypto-monnaie:</label>
                    <input
                        type="text"
                        value={newPurchase.cryptoName}
                        onChange={(e) =>
                            handleNewPurchaseChange('cryptoName', e.target.value)
                        }
                    />
                </div>
                <div>
                    <label>Prix d'achat:</label>
                    <input
                        type="text"
                        value={newPurchase.purchasePrice}
                        onChange={(e) =>
                            handleNewPurchaseChange('purchasePrice', (e.target.value))
                        }
                    />
                </div>
                <div>
                    <label>Quantité:</label>
                    <input
                        type="text"
                        value={newPurchase.quantity}
                        onChange={(e) =>
                            handleNewPurchaseChange('quantity', (e.target.value))
                        }
                    />
                </div>
                <button onClick={handleAddNewPurchase}>Ajouter</button>
            </div>
        </div>
    );
};

export default CryptoTrackerApp;
