import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { createUseStyles } from 'react-jss';
import { useDataEngine } from '@dhis2/app-runtime';
import Accordion from '../components/Accordion';
import IndicatorTable from '../components/IndicatorTable';
import { Button, Alert } from 'antd';
import Notification from '../components/Notification';
import Loader from '../components/Loader';

const useStyles = createUseStyles({
  main: {
    display: 'flex',
    width: '100%',
    height: 'fit-content',
    maxWidth: '80rem',
    margin: '3rem auto',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
  },
});

export default function Home() {
  const classes = useStyles();
  const [loadingIndicators, setLoadingIndicators] = useState(false);
  const [indicators, setIndicators] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const engine = useDataEngine();

  const fetchIndicators = async () => {
    setLoadingIndicators(true);
    try {
      const { indicators } = await engine.query({
        indicators: {
          resource: 'indicators',
          params: {
            fields: 'id,name,code',
            paging: false,
          },
        },
      });

      if (indicators) {
        const { dataElements: indicatorsDataElements } = await engine.query({
          dataElements: {
            resource: 'dataElements',
            params: {
              fields: 'id,name,code',
              paging: false,
            },
          },
        });

        const indicatorsWithDEs = indicators.indicators.map(indicator => {
          return {
            ...indicator,
            name:
              indicatorsDataElements.dataElements?.find(
                de => de.code === indicator.name
              )?.name || indicator.name,
            dataElements: indicatorsDataElements.dataElements.filter(
              de =>
                de.code?.includes(indicator.name) &&
                !de.code?.includes('Comment') &&
                !de.code?.includes('Upload') &&
                !de.code?.includes('Benchmark')
            ),
          };
        });

        setIndicators(indicatorsWithDEs);
      }
      setLoadingIndicators(false);
    } catch (error) {
      setError(`Error: ${error.message}`);
      setLoadingIndicators(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  const saveIndicators = async () => {
    setLoading(true);

    try {
      const payload = selected
        .map(indicator => {
          return indicator.dataElements.map(de => ({ id: de.id }));
        })
        .flat();

      await engine.mutate({
        resource: 'dataStore/DataElements/DataElements',
        type: 'update',
        data: payload,
      });

      setSuccess(true);
      setLoading(false);
      setSelected([]);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (error) {
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <Card
      title='Quick Links'
      className={classes.mainRoutes}
      footer={
        <div className={classes.footer}>
          <Button
            type='primary'
            onClick={saveIndicators}
            loading={loading}
            disabled={selected?.length === 0}
          >
            Save
          </Button>
        </div>
      }
    >
      {error && (
        <Notification
          message={error}
          status={'error'}
          onClose={() => setError(false)}
        />
      )}
      {success && (
        <Notification
          message={'Indicators saved successfully'}
          status={'success'}
          onClose={() => setSuccess(false)}
        />
      )}

      <Alert
        message='Select indicators to sync'
        description='Select indicators to sync with the international instance'
        type='info'
        showIcon
      />
      {loadingIndicators && <Loader type='skeleton' />}

      {indicators.map(indicator => {
        return (
          <Accordion title={indicator.name} key={indicator.id}>
            <IndicatorTable
              indicator={indicator}
              selected={selected}
              setSelected={setSelected}
            />
          </Accordion>
        );
      })}
    </Card>
  );
}
