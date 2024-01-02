/**
 * How was your day?
 * Sentiment rating for the day.
 * @date 2022-Nov-29
 */
import React, {useState, useRef} from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Rating from '@mui/material/Rating';
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';

import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

export const customRatingIcons = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" />,
    label: 'Bad day',
    value: -2,
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="warning" />,
    label: 'Bad day',
    value: -1,
  },
  3: {
    icon: <SentimentNeutralIcon color="warning" />,
    label: 'OK day',
    value: 0,
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" />,
    label: 'Good day',
    value: 1,
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" />,
    label: 'Great day',
    value: 2,
  },
};

function IconContainer(props) {
  const { value, ...other } = props;
  // const idx = value + 2
  return <span {...other}>{customRatingIcons[value].icon}</span>;
}

IconContainer.propTypes = {
  value: PropTypes.number.isRequired,
};

export function DayRatingGroup({ rating, setRating, handleDayRatingEvent }) {
  // Value must be a valid non-null integer
  const displayValue = rating == null ? -5 : rating + 3
  // const { rating, setRating } = props
  return (
    <StyledRating
      name="highlight-selected-only"
      // defaultValue={2}
      max={5}
      size="large"
      value={displayValue}
      onChange={ (e) => handleDayRatingEvent(e.target.value - 3) }  // TODO: setRating({type: "ModDayRating", value: e.target.value}); rename setRating => dispatchTimeLog ?
      IconContainerComponent={IconContainer}
      getLabelText={(_value) => customRatingIcons[_value].label}
      highlightSelectedOnly
    />
  );
}
