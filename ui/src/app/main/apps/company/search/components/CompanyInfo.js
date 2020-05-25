import React from 'react';
import { Typography, Paper } from '@material-ui/core';
import searchData from './searchData';

function CompanyInfo(props) {
    const { Item } = props.search;

    return (
        <Paper className="rounded-8 shadow m-8 mb-16 w-full p-16 items-center justify-center">
            <Typography variant="h6">삼성전자 (KRX:{Item.stockcode})</Typography>
            <p>산업: {Item.sanupcode} | 설립일: {Item.obz_date}</p>
            <p>{Item.koraddr}</p>
            <p>(Tel) {Item.tel} | (Fax) {Item.tel}</p>
            <p>매출 {Item.tel} | 영업이익 {Item.tel} | 당기순이익 {Item.tel}</p>
            <p>자산 {Item.tel} | 부채 {Item.tel} | 자본 {Item.tel}</p>
            <p>Leverage {Item.tel} | 영업이익률 {Item.tel} | ROA {Item.tel}</p>
            <p>시가총액 {Item.tel} | PER {Item.tel} | PBR {Item.tel}</p>
            <p>종업원수 {Item.tel}</p>
            <p>사업 영역: {Item.tel}</p>
        </Paper>
    )
}

export default CompanyInfo
